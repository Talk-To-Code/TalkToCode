package ast;
import java.util.*;

/**
 * @author GAO RISHENG A0101891L
 * This class is mainly for construction of AST nodes representing a constant array in C/Java
 * or a list/set/tuple in Python
 * Program and its respective syntax generation
 *
 */
public class ASTExpressionUnitLiteralArray extends ASTExpressionUnitLiteral{
	public enum bracketType { CURLY, SQUARE, ROUND };
	
	private static final String NODE_TYPE = "Array";
	private ArrayList<ASTExpression> entries;
	private bracketType bType;
	
	public ASTExpressionUnitLiteralArray(bracketType bTyp){
		super();
		initialize(bTyp);
	}

	public void addValue(String value){
		ASTExpressionUnitLiteral temp = new ASTExpressionUnitLiteral(value);
		this.entries.add(temp);
		temp.parent = this;
	}
	public void addValue(ASTExpression exp){
		this.entries.add(exp);
		exp.parent = this;
	}
	private void initialize(bracketType bTyp) {
		this.entries = new ArrayList<ASTExpression>();
		this.bType = bTyp;
	}
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
	
	public String toSyntax() {
		return toSyntax(this.bType);
	}
	
	public String toSyntax(bracketType bTyp) {
		switch(bType){
		case CURLY:
		{
			this.result = "";
			this.result += "{";
			int index = 0;
			for(;index<this.entries.size()-1;index++){
				this.result+= this.entries.get(index).toSyntax();
				this.result+= ", ";
			}
			if(this.entries.size() > 0) this.result+= this.entries.get(index).toSyntax();
			this.result += "}";
			if(this.isQuoted) quote();
			return this.result;
		}
		case SQUARE:
		{
			this.result = "";
			this.result += "[";
			int index = 0;
			for(;index<this.entries.size()-1;index++){
				this.result+= this.entries.get(index).toSyntax();
				this.result+= ", ";
			}
			if(this.entries.size() > 0) this.result+= this.entries.get(index).toSyntax();
			this.result += "]";
			if(this.isQuoted) quote();
			return this.result;
		}
		case ROUND:
		{
			this.result = "";
			this.result += "(";
			int index = 0;
			for(;index<this.entries.size()-1;index++){
				this.result+= this.entries.get(index).toSyntax();
				this.result+= ", ";
			}
			if(this.entries.size() > 0) this.result+= this.entries.get(index).toSyntax();
			this.result += ")";
			if(this.isQuoted) quote();
			return this.result;
		}
		default:
			return "";
		}
		
	}
}
