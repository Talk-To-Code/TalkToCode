package ast;
import java.util.*;

/**
 * @author GAO RISHENG A0101891L
 * This class is mainly for construction of AST nodes representing a constant array in C/Java/Python
 * Program and its respective syntax generation
 *
 */
public class ASTExpressionUnitLiteralArray extends ASTExpressionUnitLiteral{
	private static final String NODE_TYPE = "Array";
	private ArrayList<ASTExpression> entries;
	private int size;
	
	
	public ASTExpressionUnitLiteralArray(){
		super();
		initialize();
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
	private void initialize() {
		this.entries = new ArrayList<ASTExpression>();
		this.size = entries.size();
	}
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
	
	public String toSyntax(int programmingLanguageSyntax) throws Exception{
		switch(programmingLanguageSyntax){
		case INDEX_C:
		case INDEX_JAVA:
		{
			this.result = "";
			this.result += "{";
			int index = 0;
			for(;index<size-1;index++){
				this.result+= this.entries.get(index).toSyntax();
				this.result+= ", ";
			}
			this.result+= this.entries.get(index).toSyntax();
			this.result += "}";
			return this.result;
		}
		case INDEX_PYTHON:
		{
			this.result = "";
			this.result += "[";
			int index = 0;
			for(;index<size-1;index++){
				this.result+= this.entries.get(index).toSyntax();
				this.result+= ", ";
			}
			this.result+= this.entries.get(index).toSyntax();
			this.result += "]";
			return this.result;
		}
		default:
			throw new Exception("Not supported Programming Language.");
		}
		
	}
}
