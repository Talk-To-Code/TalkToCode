package ast;
import java.util.*;
/**
 * @author GAO RISHENG A0101891L
 * This class is mainly in charge of construction of AST nodes that represents
 * a term of an index of an array (like x[a],arr[1][2] etc) 
 * and syntax generation of the respective term.
 * This is available in all C/JAVA/PYTHON.
 */
public class ASTExpressionUnitIdentifierArrayObject extends ASTExpressionUnitIdentifier{
	private static final String NODE_TYPE = "Array Object";
	private ArrayList<ASTExpression> indexes;
	private String name;
	private int dimension;
	
	private void initialize() {
		this.indexes  = new ArrayList<ASTExpression>();
		this.dimension = 0;
	}
	
	public ASTExpressionUnitIdentifierArrayObject(){
		super();
		initialize();
	}

	public ASTExpressionUnitIdentifierArrayObject(String name){
		this.name = name;
		initialize();
	}
	public void addIndex(ASTExpression index){
		this.indexes.add(index);
		this.dimension++;
		index.parent = this;
	}
	//syntax construction
	public String toSyntax(){
			this.result = "";
			this.result+=this.name;
			for(int i = 0; i<this.dimension;i++){
				this.result+="[";
				this.result+=this.indexes.get(i).toSyntax();
				this.result+="]";
			}
			
			return this.result;
		
		
	}
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
}
